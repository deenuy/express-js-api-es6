import express from "express";
import request from "request";
var router = express.Router();

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
          "http://127.0.0.1:8529/_db/flmc-xpis-dev/api/dev/v2/part/bom_graphistry?product_number=" +
          product_num,
        headers: {
          "content-type": "application/json",
        },
        Authorization:
          "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJyb290IiwiaXNzIjoiYXJhbmdvZGIiLCJpYXQiOjE2NTMzNzY1NTgsImV4cCI6MTY1NTk2ODU1OH0.g4iZR9waevKPjO6iPE3X0Dcnd7XUT7d9h44fmhIS_YI",
      },
      (error, response, body) => {
        const data = JSON.parse(body);
        res.send(body);
      }
    );
  } catch (error) {
    res.send(error);
  }
});

export default router;
