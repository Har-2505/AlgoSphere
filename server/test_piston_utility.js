const dotenv = require('dotenv');
dotenv.config();

const { getLanguageById, submitBatch, submitToken } = require('./src/utils/problemUtility');

async function runTest() {
    console.log("Starting code execution test through problemUtility...");
    
    const sourceCode = `#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`;

    const submissions = [
        {
            source_code: sourceCode,
            language_id: 54, // C++ (GCC)
            stdin: "2 3",
            expected_output: "5"
        },
        {
            source_code: sourceCode,
            language_id: 54,
            stdin: "10 20",
            expected_output: "30"
        }
    ];

    try {
        console.log("Submitting batch...");
        const submitResult = await submitBatch(submissions);
        console.log("Submit Batch Result (Mock Tokens):", submitResult);

        const tokens = submitResult.map(res => res.token);
        
        console.log("Retrieving execution results...");
        const testResult = await submitToken(tokens);
        console.log("Execution Results:\n", JSON.stringify(testResult, null, 2));

        const allPassed = testResult.every(test => test.status_id === 3);
        if (allPassed) {
            console.log("\n SUCCESS: All test cases passed successfully!");
        } else {
            console.log("\n FAILURE: Some test cases failed.");
        }
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

runTest();
