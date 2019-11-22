import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import LambdaXraySample = require('../lib/lambda-xray-sample-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new LambdaXraySample.LambdaXraySampleStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});