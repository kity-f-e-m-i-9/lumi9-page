<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;

class PhoneVerifiedUserProvider extends EloquentUserProvider
{
    public function validateCredentials(UserContract $user, array $credentials)
    {
        if (is_null($user->phone_verified_at)) {
            return false;
        }

        return parent::validateCredentials($user, $credentials);
    }
}
