<!DOCTYPE html>
<html>
<head>
    <title>System Error Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
        }
        .header {
            background: #007bff;
            color: white;
            padding: 15px;
            border-radius: 5px 5px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .field {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            margin-top: 5px;
            padding: 10px;
            background: white;
            border-radius: 3px;
        }
        .message-box {
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-left: 4px solid #007bff;
            border-radius: 3px;
        }
        .stack-trace {
            white-space: pre-wrap;
            font-family: Menlo, Consolas, monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>System Error Alert</h1>
        <h2>{{ $errorSubject }}</h2>

        <table>
            <tbody>
                @foreach($errorDetails as $key => $value)
                    <tr>
                        <th>{{ $key }}</th>
                        <td>
                            @if($key == 'Stack Trace')
                                <div class="stack-trace">{{ $value }}</div>
                            @else
                                {{ $value }}
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <p class="timestamp">Timestamp: {{ $timestamp }}</p>
        <p>This is an automated alert from the {{ config('app.name') }} system.</p>
    </div>
</body>
</html>
