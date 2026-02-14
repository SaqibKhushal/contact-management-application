package com.contactmanagement.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Basic integration tests for the Contact Management application.
 * These tests verify that the Spring application context loads successfully.
 */
@SpringBootTest
class BackendApplicationTests {

	/**
	 * Test that the Spring application context loads without errors.
	 * This is a smoke test to catch major configuration issues.
	 */
	@Test
	void contextLoads() {
		// This test passes if the application context loads successfully
		// No assertions needed - context loading itself is the test
	}

}
