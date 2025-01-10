"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while ((g && ((g = 0), op[0] && (_ = 0)), _))
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y["return"]
                                    : op[0]
                                      ? y["throw"] ||
                                        ((t = y["return"]) && t.call(y), 0)
                                      : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys),
                                (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (
                                op[0] === 3 &&
                                (!t || (op[1] > t[0] && op[1] < t[3]))
                            ) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
var url = require("url");
var app = (0, express_1.default)();
app.use(express_1.default.json());
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
var __dirname = url.fileURLToPath(new URL("..", import.meta.url));
var dbfile = "".concat(__dirname, "database.db");
var db = await (0, sqlite_1.open)({
    filename: dbfile,
    driver: sqlite3_1.default.Database,
});
await db.get("PRAGMA foreign_keys = ON");
//
// SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//
// insert example
await db.run(
    "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')",
);
await db.run(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')",
);
// insert example with parameterized queries
// important to use parameterized queries to prevent SQL injection
// when inserting untrusted data
var statement = await db.prepare(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)",
);
await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
await statement.run();
// select examples
var authors = await db.all("SELECT * FROM authors");
console.log("Authors", authors);
var books = await db.all("SELECT * FROM books WHERE author_id = '1'");
console.log("Books", books);
var filteredBooks = await db.all("SELECT * FROM books WHERE pub_year = '1867'");
console.log("Some books", filteredBooks);
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error
app.get("/foo", function (req, res) {
    if (!req.query.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({
        message: "You sent: ".concat(req.query.bar, " in the query"),
    });
});
app.post("/foo", function (req, res) {
    if (!req.body.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({
        message: "You sent: ".concat(req.body.bar, " in the body"),
    });
});
app.delete("/foo", function (req, res) {
    // etc.
    res.sendStatus(200);
});
//
// ASYNC/AWAIT EXAMPLE
//
function sleep(ms) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
    });
}
// need async keyword on request handler to use await inside it
app.get("/bar", function (req, res) {
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Waiting...");
                    // await is equivalent to calling sleep.then(() => { ... })
                    // and putting all the code after this in that func body ^
                    return [4 /*yield*/, sleep(3000)];
                case 1:
                    // await is equivalent to calling sleep.then(() => { ... })
                    // and putting all the code after this in that func body ^
                    _a.sent();
                    // if we omitted the await, all of this code would execute
                    // immediately without waiting for the sleep to finish
                    console.log("Done!");
                    return [2 /*return*/, res.sendStatus(200)];
            }
        });
    });
});
// test it out! while server is running:
// curl http://localhost:3000/bar
// run server
var port = 3000;
var host = "localhost";
var protocol = "http";
app.listen(port, host, function () {
    console.log("".concat(protocol, "://").concat(host, ":").concat(port));
});
