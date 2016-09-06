/* jshint esversion: 6 */
const piper = require('../index');
const request = require('../src/request');

const hostname = 'localhost';
const port = 3000;

require('./default')(hostname, port, piper, request);