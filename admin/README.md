# Dragnet Admin Server
This server handles vishing calls, automated osint and machine learning.

# OSINT
We use nightmare.js (headless) to perform automated scraping.
Most integrations utilized for osint can be run in cloud functions.

# ML
Tensorflow is used for training and prediction

# Endpoint
This admin server runs a Node REST endpoint using Express.
We use cloud functions to hit this endpoint.
