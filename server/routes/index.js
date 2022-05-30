import express from "express";
import request from "request";
import config from "../config/default.js";

import { EdgeFile, NodeFile, Dataset, Client } from "@graphistry/node-api";

var router = express.Router();

const user = process.env.GRAPHISTRY_USER || config.graphistry.user;
if (!user) {
  throw new Error("GRAPHISTRY_USER environment variable not set");
}

const password = process.env.GRAPHISTRY_PASSWORD || config.graphistry.password;
if (!password) {
  throw new Error("GRAPHISTRY_PASSWORD environment variable not set");
}

const protocol = process.env.GRAPHISTRY_PROTOCOL || "https";
const host = process.env.GRAPHISTRY_HOST || "hub.graphistry.com";

const client = new Client(user, password, protocol, host);

async function create_graphistry_dataset(data, product_num) {
  const edgesRows = data._documents[0].edges;
  const nodesRows = data._documents[0].nodes;

  const edgesFile = new EdgeFile(edgesRows, "json", "my_edges", {
    description: "My row-oriented edges json file",
    parser_options: { orient: "records" },
    //also: file_compression, sql_transforms
  });
  const nodesFile = new NodeFile(nodesRows, "json", "my_nodes", {
    // optional
    parser_options: { orient: "records" },
  });

  const dataset = new Dataset(
    {
      node_encodings: { bindings: { node: "_id" } },
      edge_encodings: { bindings: { source: "_from", destination: "_to" } },
      metadata: {},
      name: product_num,
    },
    edgesFile,
    nodesFile
  );

  await dataset.upload(client);

  console.log(
    "Succeess! Uploaded dataset to Graphistry: URL: " + dataset.datasetURL
  );
  console.log("Succeess! Dataset ID: " + dataset.datasetID);
  // console.log(`View dataset ${dataset.datasetID} at ${dataset.datasetURL}`);

  return dataset.datasetID;
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// GET API
router.get("/flmc/graphistry", async (req, res) => {
  const product_num = req.query.product_number;

  try {
    request.get(
      {
        url:
          config.arangodb.api_url +
          "/part/bom_graphistry?product_number=" +
          product_num,
        headers: {
          "content-type": "application/json",
        },
        Authorization: config.arangodb.api_token,
      },
      (error, response, body) => {
        const data = JSON.parse(body);
        // console.log(data._documents[0].edges.length == 0);
        if (data._documents[0].edges.length != 0) {
          let result = create_graphistry_dataset(data, product_num);
          console.log("API response: ", result);
          res.send(result);
        }
      }
    );
  } catch (error) {
    res.send(error);
  }
});

export default router;
