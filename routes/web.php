<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/google', [LoginController::class, 'redirectToGoogle'])->name('user.login.google');
Route::get('/google/callback', [LoginController::class, 'handleGoogleCallback']);

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
