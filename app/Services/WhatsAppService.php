<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiToken;
    protected $phoneNumberId;

    public function __construct()
    {
        $this->apiToken = config('services.whatsapp.api_token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
    }

    public function sendTemplateMessage(string $phone, string $templateName, array $vars = [], string $lang = 'en_US')
    {
        $to = ltrim($phone, '+');

        $params = [];
        foreach ($vars as $v) {
            $params[] = ['type' => 'text', 'text' => is_array($v) ? ($v['value'] ?? '') : (string) $v];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $lang],
                'components' => [[
                    'type' => 'body',
                    'parameters' => $params,
                ]],
            ],
        ];

        try {
            $res = Http::withToken($this->apiToken)
                ->acceptJson()
                ->asJson()
                ->post("https://graph.facebook.com/v20.0/{$this->phoneNumberId}/messages", $payload);

            if ($res->failed()) {
                $json = $res->json();
                Log::error('WA Cloud send failed', [
                    'status' => $res->status(),
                    'error' => data_get($json, 'error.message') ?: $res->body(),
                    'code' => data_get($json, 'error.code'),
                    'payload' => $payload,
                ]);

                return ['status' => 0, 'message' => data_get($json, 'error.message') ?: 'Send failed'];
            }

            Log::info('WA Cloud template sent', [
                'to' => $to,
                'template' => $templateName,
                'wamid' => data_get($res->json(), 'messages.0.id'),
            ]);

            return [
                'status' => '1',
                'message' => 'Message sent successfully',
                'data' => $res->json(),
            ];
        } catch (\Throwable $e) {
            Log::error('WA Cloud exception', ['error' => $e->getMessage()]);

            return ['status' => 0, 'message' => $e->getMessage()];
        }
    }
}
