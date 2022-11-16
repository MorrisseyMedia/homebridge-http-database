"use strict";
let Service, Characteristic;
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 15015;

module.exports = homebridge => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-http-database", "HTTP DB", HTTPDB);
};

let HTTPDB = class {
  constructor(log, config) {
    this.log = log;
    this.config = config;
    this.name = config.name;
    this.pathName = config.db_path;

    this.startServer();
  }

  startServer() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(bodyParser.text());

    app.listen(port, () => {
      this.log("Server running on port: " + port);
    });

    app.post("/:id", (req, res) => {
      let json;
      if (req.headers["content-type"] == "text/plain") {
        json = req.body;
      } else if (req.headers["content-type"] == "application/json") {
        json = JSON.stringify(req.body);
      }

      if (fs.existsSync(path.join(this.pathName))) {
        // this.log("Folder already exists");
        fs.writeFile(path.join(this.pathName, req.params.id + ".json"), json, "utf-8", error => {
          if (error) {
            res.status(500).send("Unable to create file");
            // this.log("Unable to create file", error);
          }
          // this.log("File " + req.params.id + ".json was created");
          res.status(200).send("Successfully recorded");
        });
      } else {
        fs.mkdir(path.join(this.pathName), error => {
          if (error) {
            // this.log("Unable to create folder");
            res.status(500).send("Unable to create folder");
          }
          // this.log("Папка был создан");
          fs.writeFile(path.join(this.pathName, req.params.id + ".json"), json, "utf-8", error => {
            if (error) {
              res.status(500).send("Unable to create file");
              // this.log("Unable to create file", error);
            }
            // this.log("File " + req.params.id + ".json was created");
            res.status(200).send("Successfully recorded");
          });
        });
      }
    });

    app.put("/:id", (req, res) => {
      if (fs.existsSync(path.join(this.pathName))) {
        // this.log("Folder already exists");

        fs.readFile(path.join(this.pathName, req.params.id + ".json"), "utf-8", (error, data) => {
          if (error) {
            res.status(500).send("Error reading file");
            // this.log("Error reading file", error);
          }

          let json = JSON.parse(data);

          let dataBody;
          if (req.headers["content-type"] == "text/plain") {
            dataBody = Object.entries(JSON.parse(req.body));
          } else if (req.headers["content-type"] == "application/json") {
            dataBody = Object.entries(req.body);
          }

          for (let [key, value] of dataBody) {
            json[key] = value;
          }

          fs.writeFile(path.join(this.pathName, req.params.id + ".json"), JSON.stringify(json), "utf-8", error => {
            if (error) {
              res.status(500).send("Unable to create file");
              // this.log("Unable to create file", error);
            }
            // this.log("File " + req.params.id + ".json was created");
            res.status(200).send("Successfully updated");
          });
        });
      } else {
        fs.mkdir(path.join(this.pathName), error => {
          if (error) {
            // this.log("Unable to create folder");
            res.status(500).send("Unable to create folder");
          }
          // this.log("Папка был создан");
          fs.writeFile(path.join(this.pathName, req.params.id + ".json"), json, "utf-8", error => {
            if (error) {
              res.status(500).send("Unable to create file");
              // this.log("Unable to create file", error);
            }
            // this.log("File " + req.params.id + ".json was created");
            res.status(200).send("Successfully recorded");
          });
        });
      }
    });

    app.get("/:id", (req, res) => {
      if (fs.existsSync(path.join(this.pathName))) {
        // this.log("Folder already exists");
        if (fs.existsSync(path.join(this.pathName, req.params.id + ".json"))) {
          fs.readFile(path.join(this.pathName, req.params.id + ".json"), "utf-8", (error, data) => {
            if (error) {
              res.status(500).send("Error reading file");
              // this.log("Error reading file", error);
            }
            // this.log(data);
            res.status(200).json(JSON.parse(data));
          });
        } else {
          res.status(404).send("There is no such " + req.params.id + ".json File, write it down first");
        }
      } else {
        res.status(404).send("No HTTPDB folder, write down anything");
      }
    });

    app.get("/", async (req, res) => {
      fs.readdir(this.pathName, (error, items) => {
        if (error) {
          res.status(500).send("Error reading folder");
        }

        if (!items.length) {
          res.status(404).send("No HTTPDB folder, write down anything");
        }

        let result = {};

        items.forEach(item => {
          const name = item.split(".");
          result[name[0]] = name[0];
        });

        res.status(200).json(result);
      });
    });
  }

  getServices() {
    this.informationService = new Service.AccessoryInformation();

    this.informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Morrissey Media")
      .setCharacteristic(Characteristic.Model, "HTTP DB")
      .setCharacteristic(Characteristic.SerialNumber, "A1B2C3D4E5F6");

    return [this.informationService];
  }
};
