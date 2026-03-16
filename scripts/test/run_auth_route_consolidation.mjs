#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const authPaths = read("src/auth/authPaths.ts");
assert(authPaths.includes('AUTH_LOGIN_PATH = "/aurelius/login"'), "AUTH_LOGIN_PATH ontbreekt");
assert(authPaths.includes('AUTH_DEFAULT_AFTER_LOGIN_PATH = "/portal/dashboard"'), "AUTH_DEFAULT_AFTER_LOGIN_PATH ontbreekt");
assert(authPaths.includes('AUTH_RESET_PASSWORD_PATH = "/reset-password"'), "AUTH_RESET_PASSWORD_PATH ontbreekt");

const app = read("src/App.tsx");
assert(app.includes("AUTH_LOGIN_PATH"), "App gebruikt AUTH_LOGIN_PATH niet");
assert(app.includes("AUTH_DEFAULT_AFTER_LOGIN_PATH"), "App gebruikt AUTH_DEFAULT_AFTER_LOGIN_PATH niet");
assert(app.includes("AUTH_RESET_PASSWORD_PATH"), "App gebruikt AUTH_RESET_PASSWORD_PATH niet");

const login = read("src/auth/LoginPage.tsx");
assert(login.includes("AUTH_DEFAULT_AFTER_LOGIN_PATH"), "LoginPage gebruikt AUTH_DEFAULT_AFTER_LOGIN_PATH niet");
assert(login.includes("toAuthAbsolute(redirectTo)"), "LoginPage gebruikt geen geconsolideerde OAuth redirect helper");

const reset = read("src/pages/ResetPasswordPage.tsx");
assert(reset.includes("toAuthAbsolute(AUTH_LOGIN_PATH)"), "ResetPasswordPage redirect is niet geconsolideerd");

const signup = read("src/pages/SignupPage.tsx");
assert(signup.includes("toAuthAbsolute(AUTH_LOGIN_PATH)"), "SignupPage redirect is niet geconsolideerd");

console.log("auth route consolidation test passed");
