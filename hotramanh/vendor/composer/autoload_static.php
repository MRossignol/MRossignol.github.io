<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitb3f6e03fd88b6c283d4a93fe0bc7e520
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PHPMailer\\PHPMailer\\' => 20,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PHPMailer\\PHPMailer\\' => 
        array (
            0 => __DIR__ . '/..' . '/phpmailer/phpmailer/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitb3f6e03fd88b6c283d4a93fe0bc7e520::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitb3f6e03fd88b6c283d4a93fe0bc7e520::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitb3f6e03fd88b6c283d4a93fe0bc7e520::$classMap;

        }, null, ClassLoader::class);
    }
}
