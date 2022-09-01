import { expect, it } from "vitest";
import { RouteData } from "./types";
import { matchRoutes } from "./utils";

const getRoutes = (): RouteData[] => [
  {
    path: "/",
    children: [
      {
        path: "home/:from/",
        children: [
          { path: "*" },
          {
            path: "post/:id",
          },
          {
            path: "post/1",
            children: [
              {
                children: [{ path: "xx" }],
              },
            ],
          },
        ],
      },
    ],
  },
];

it("root match", () => {
  const matchedRoutes = matchRoutes("/home/www", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
  ]);
});

it("match test1", () => {
  const matchedRoutes = matchRoutes("/home/www/post", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
    { path: "*", params: { from: "www" }, pathname: "/home/www/post" },
  ]);
});

it("match test2", () => {
  const matchedRoutes = matchRoutes("/home/www/post/1", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
    {
      path: "post/1",
      params: { from: "www" },
      pathname: "/home/www/post/1",
    },
    { params: { from: "www" }, pathname: "/home/www/post/1" },
  ]);
});

it("match test3", () => {
  const matchedRoutes = matchRoutes("/home/www/post/2", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
    {
      path: "post/:id",
      params: { from: "www", id: "2" },
      pathname: "/home/www/post/2",
    },
  ]);
});

it("match test4", () => {
  const matchedRoutes = matchRoutes("/home/www/post/1/x", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
    {
      path: "*",
      params: { from: "www" },
      pathname: "/home/www/post/1/x",
    },
  ]);
});

it("match test5", () => {
  const matchedRoutes = matchRoutes("/home/www/post/1/xx", getRoutes());
  expect(matchedRoutes).toMatchObject([
    { path: "/", params: {}, pathname: "/" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/home/www",
    },
    {
      path: "post/1",
      params: { from: "www" },
      pathname: "/home/www/post/1",
    },
    {
      params: { from: "www" },
      pathname: "/home/www/post/1",
    },
    {
      path: "xx",
      params: { from: "www" },
      pathname: "/home/www/post/1/xx",
    },
  ]);
});

it("match test6", () => {
  const matchedRoutes = matchRoutes("/app/home/www/post/1/x", getRoutes(), [
    { path: "/app" },
  ]);
  expect(matchedRoutes).toMatchObject([
    { path: "/app", params: {}, pathname: "/app" },
    { path: "/", params: {}, pathname: "/app" },
    {
      path: "home/:from/",
      params: { from: "www" },
      pathname: "/app/home/www",
    },
    {
      path: "*",
      params: { from: "www" },
      pathname: "/app/home/www/post/1/x",
    },
  ]);
});
