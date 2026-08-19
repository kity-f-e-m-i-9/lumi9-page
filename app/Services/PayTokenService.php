<?php

namespace App\Services;

/**
 * Signs and verifies the opaque token used to hand off a temp_orders row
 * to the femi9.in payment page. Both apps share the same secret (services.lumi9_pay.secret)
 * so femi9.in can verify a token without any additional API call.
 */
class PayTokenService
{
    protected string $secret;

    public function __construct()
    {
        $this->secret = (string) config('services.lumi9_pay.secret');
    }

    public function make(int $tempOrderId, int $ttlMinutes = 30): string
    {
        $expires = now()->addMinutes($ttlMinutes)->timestamp;
        $payload = base64_encode(json_encode(['id' => $tempOrderId, 'exp' => $expires]));
        $signature = hash_hmac('sha256', $payload, $this->secret);

        return $payload.'.'.$signature;
    }

    /**
     * Returns the temp_order id if the token is valid and unexpired, null otherwise.
     */
    public function verify(string $token): ?int
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$payload, $signature] = $parts;
        $expected = hash_hmac('sha256', $payload, $this->secret);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        $data = json_decode(base64_decode($payload), true);
        if (! is_array($data) || empty($data['id']) || empty($data['exp'])) {
            return null;
        }

        if ($data['exp'] < now()->timestamp) {
            return null;
        }

        return (int) $data['id'];
    }
}
