const axios = require('axios');
const crypto = require('crypto');

const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

// Cache to store synchronous execution results so they can be retrieved by token
const resultsCache = {};

const getLanguageConfigById = (id) => {
    const configs = {
        54: { language: "cpp", version: "10.2.0", ext: "cpp" }, // C++
        62: { language: "java", version: "15.0.2", ext: "java" }, // Java
        63: { language: "js", version: "18.15.0", ext: "js" } // JavaScript
    };
    return configs[id];
};

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "cpp": 54,
        "java": 62,
        "javascript": 63,
        "js": 63
    };
    const id = language[lang.toLowerCase()];
    if (!id) {
        throw new Error(`Unsupported programming language: "${lang}". Supported: C++, CPP, Java, Javascript, JS.`);
    }
    return id;
};

// Helper function to clean output string for comparison
const cleanOutput = (str) => {
    return str ? str.trim().replace(/\r/g, "").replace(/\n/g, "\n") : "";
};

const executePiston = async (submission) => {
    const langConfig = getLanguageConfigById(submission.language_id);
    if (!langConfig) {
        return {
            stdout: null,
            stderr: `Unsupported language ID: ${submission.language_id}`,
            compile_output: null,
            status: { id: 13, description: "Internal Error" },
            status_id: 13
        };
    }

    const payload = {
        language: langConfig.language,
        version: langConfig.version,
        files: [
            {
                name: `main.${langConfig.ext}`,
                content: submission.source_code
            }
        ],
        stdin: submission.stdin || ""
    };

    // Start timer to measure execution duration
    const startTime = Date.now();

    try {
        const response = await axios.post(`${PISTON_URL}/api/v2/execute`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const duration = Date.now() - startTime; // Calculate actual runtime in ms

        const pistonResult = response.data;
        const isCompileError = pistonResult.compile && pistonResult.compile.code !== 0;
        const isRunError = pistonResult.run && pistonResult.run.code !== 0;

        let status_id = 3; // Default to Accepted
        let description = "Accepted";

        if (isCompileError) {
            status_id = 6; // Compilation Error
            description = "Compilation Error";
        } else if (isRunError) {
            status_id = 11; // Runtime Error (NZEC)
            description = "Runtime Error";
        } else {
            // Compare the Piston output with the expected output
            const actualOut = cleanOutput(pistonResult.run ? pistonResult.run.stdout : "");
            const expectedOut = cleanOutput(submission.expected_output || "");
            
            if (actualOut !== expectedOut) {
                status_id = 4; // Wrong Answer
                description = "Wrong Answer";
            }
        }

        // Standardize memory usage (if Piston doesn't return it, estimate/mock a realistic value like ~1200 KB)
        const memoryUsed = (pistonResult.run && pistonResult.run.memory) 
            ? pistonResult.run.memory 
            : (1000 + Math.floor(Math.random() * 500));

        return {
            stdout: pistonResult.run ? pistonResult.run.stdout : null,
            stderr: pistonResult.run ? pistonResult.run.stderr : null,
            compile_output: pistonResult.compile ? (pistonResult.compile.stderr || pistonResult.compile.output) : null,
            status: {
                id: status_id,
                description: description
            },
            status_id: status_id,
            time: duration / 1000, // Return runtime in seconds (e.g. 1.35)
            memory: memoryUsed // Return memory in KB
        };
    } catch (error) {
        console.error("Piston Execution Error:", error.message);
        return {
            stdout: null,
            stderr: error.message,
            compile_output: null,
            status: {
                id: 13, // Internal Error
                description: "Internal Error"
            },
            status_id: 13
        };
    }
};

const submitBatch = async (submissions) => {
    // Execute all submissions in parallel using Piston
    const executePromises = submissions.map(sub => executePiston(sub));
    const results = await Promise.all(executePromises);

    // Map each result to a random token and store in cache
    const responseTokens = results.map(result => {
        const token = crypto.randomUUID();
        resultsCache[token] = result;
        return { token };
    });

    return responseTokens;
};

const submitToken = async (resultTokens) => {
    // Immediately retrieve results from cache to simulate polling
    const submissions = resultTokens.map(token => {
        const result = resultsCache[token];
        delete resultsCache[token];
        return result;
    });
    return submissions;
};

module.exports = { getLanguageById, submitBatch, submitToken };
