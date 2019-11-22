#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { LambdaXraySampleStack } from '../lib/lambda-xray-sample-stack';

const app = new cdk.App();
new LambdaXraySampleStack(app, 'LambdaXraySampleStack');
