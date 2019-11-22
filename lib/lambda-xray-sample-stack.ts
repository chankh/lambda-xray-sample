import cdk = require('@aws-cdk/core');
import apigateway = require("@aws-cdk/aws-apigateway");
import iam = require("@aws-cdk/aws-iam");
import lambda = require("@aws-cdk/aws-lambda");
import logs = require("@aws-cdk/aws-logs");

export class LambdaXraySampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const fnB = new lambda.Function(this, "FnBHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.asset("src/fnB"),
      handler: "fnB.main",
      tracing: lambda.Tracing.ACTIVE
    });
    
    new logs.LogGroup(this, "FnBLogs", {
      logGroupName: "/aws/lambda/" + fnB.functionName
    })
    
    const fnA = new lambda.Function(this, "FnAHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.asset("src/fnA"),
      handler: "fnA.main",
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        FUNCTION_B: fnB.functionName
      }
    });
    
    fnA.addToRolePolicy(new iam.PolicyStatement({
      resources: [fnB.functionArn],
      actions: ["lambda:InvokeFunction"]
    }))
    
    new logs.LogGroup(this, "FnALogs", {
      logGroupName: "/aws/lambda/" + fnA.functionName
    })
    
    const api = new apigateway.RestApi(this, "sample-api", {
      restApiName: "Sample Lambda Service",
      description: "This service is a sample with X-Ray integration.",
      deployOptions: {
        tracingEnabled: true
      }
    });

    const getWidgetsIntegration = new apigateway.LambdaIntegration(fnA, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getWidgetsIntegration); // GET /
  }
}
