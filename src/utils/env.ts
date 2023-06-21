import * as dotenv from "dotenv";

const isTestEnvironment = process.env.NODE_ENV === "test";

// Load environment variables based on the environment
if (isTestEnvironment) {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

export function getEnvironment() {
    return process.env
}