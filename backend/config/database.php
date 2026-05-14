<?php

return [

    'default' => env('DB_CONNECTION', 'mongodb'),

    'connections' => [

        'mongodb' => [
            'driver'   => 'mongodb',
            'host'     => env('DB_HOST', '127.0.0.1'),
            'port'     => env('DB_PORT', 27017),
            'database' => env('DB_DATABASE', 'facultyup_db'),
            'username' => env('DB_USERNAME', ''),
            'password' => env('DB_PASSWORD', ''),
            'options'  => [
                'database' => env('DB_AUTHENTICATION_DATABASE', 'admin'),
            ],
        ],

        // Fallback SQLite for testing
        'sqlite' => [
            'driver'   => 'sqlite',
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix'   => '',
            'foreign_key_constraints' => true,
        ],

    ],

    'migrations' => 'migrations',

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'default' => [
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port'     => env('REDIS_PORT', 6379),
            'database' => env('REDIS_DB', 0),
        ],
    ],

];
