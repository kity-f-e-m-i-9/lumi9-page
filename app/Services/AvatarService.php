<?php

namespace App\Services;

class AvatarService
{
    private $bgColor = '#4e7661';

    private $textColor = '#ffffff';

    private $size = 200;

    private $fontSize = 75;

    public function generateAvatar($name)
    {
        $displayText = $this->getFirstTwoLetters($name);
        $image = $this->createImage();
        $this->addTextToImage($image, $displayText);

        $avatarName = $this->getAvatarFileName($name);
        $this->saveImage($image, $avatarName);

        imagedestroy($image);

        return $avatarName;
    }

    private function getFirstTwoLetters($name)
    {
        $name = trim($name);
        if (strlen($name) < 2) {
            return strtoupper($name.'X');
        }

        return strtoupper(substr($name, 0, 2));
    }

    private function createImage()
    {
        $image = imagecreate($this->size, $this->size);
        $bg = imagecolorallocate(
            $image,
            hexdec(substr($this->bgColor, 1, 2)),
            hexdec(substr($this->bgColor, 3, 2)),
            hexdec(substr($this->bgColor, 5, 2))
        );
        imagefill($image, 0, 0, $bg);

        return $image;
    }

    private function addTextToImage($image, $displayText)
    {
        $text = imagecolorallocate(
            $image,
            hexdec(substr($this->textColor, 1, 2)),
            hexdec(substr($this->textColor, 3, 2)),
            hexdec(substr($this->textColor, 5, 2))
        );

        $fontPath = public_path('fonts/arial.ttf');
        $text_box = imagettfbbox($this->fontSize, 0, $fontPath, $displayText);
        $text_width = $text_box[2] - $text_box[0];
        $text_height = $text_box[3] - $text_box[5];

        $x = ($this->size - $text_width) / 2;
        $y = ($this->size + $text_height) / 2;

        imagettftext($image, $this->fontSize, 0, $x, $y, $text, $fontPath, $displayText);
    }

    private function getAvatarFileName($name)
    {
        return str_replace(' ', '_', $name).'_avatar.png';
    }

    private function saveImage($image, $fileName)
    {
        $publicPath = public_path('assets/images/avatar/'.$fileName);
        imagepng($image, $publicPath);
    }
}
