<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app'     => 'FacultyUp API',
        'version' => '1.0.0',
        'status'  => 'running',
        'docs'    => '/api/v1',
    ]);
});
