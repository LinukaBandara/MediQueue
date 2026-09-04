<?php

// config/cors.php
// Required for Next.js (a different origin/port) to send credentialed
// (cookie-carrying) requests to Laravel. `supports_credentials` MUST be
// true, and `allowed_origins` must NOT be '*' when using credentials —
// browsers reject wildcard origin + credentials combinations.

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
