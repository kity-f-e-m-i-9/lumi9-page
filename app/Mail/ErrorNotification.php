<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ErrorNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The error details.
     *
     * @var array
     */
    public $errorSubject;
    public $errorDetails;
    public $timestamp;

    /**
     * Create a new message instance.
     *
     * @param string $errorSubject
     * @param array $errorDetails
     * @return void
     */
    public function __construct($errorSubject, array $errorDetails)
    {
        $this->errorSubject = $errorSubject;
        $this->errorDetails = $errorDetails;
        $this->timestamp = now()->format('Y-m-d H:i:s');
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('ALERT: ' . $this->errorSubject . ' - ' . config('app.name'))
                    ->view('emails.error-notification')
                    ->with([
                        'errorSubject' => $this->errorSubject,
                        'errorDetails' => $this->errorDetails,
                        'timestamp' => $this->timestamp
                    ]);
    }
}
