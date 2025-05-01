// Test Runner Module
import { testLogger } from './testLogger.js';

export const testRunner = {
    tests: new Map(),
    
    registerTest(name, testFn) {
        this.tests.set(name, testFn);
    },
    
    async runTest(name) {
        const test = this.tests.get(name);
        if (!test) {
            testLogger.error(`Test "${name}" not found`);
            return false;
        }
        
        try {
            testLogger.log(`Running test: ${name}`);
            await test();
            testLogger.success(`Test "${name}" passed`);
            return true;
        } catch (error) {
            testLogger.error(`Test "${name}" failed: ${error.message}`);
            return false;
        }
    },
    
    async runAllTests() {
        let passed = 0;
        let failed = 0;
        
        testLogger.log('Starting test run...');
        
        for (const [name] of this.tests) {
            const success = await this.runTest(name);
            if (success) {
                passed++;
            } else {
                failed++;
            }
        }
        
        testLogger.log(`Test run complete. ${passed} passed, ${failed} failed`);
    },

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} but got ${actual}`);
        }
    },

    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },

    assertFalse(condition, message) {
        if (condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
};