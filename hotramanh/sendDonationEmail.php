<?php

require "vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// $developmentMode = true;
$mailer = new PHPMailer($developmentMode);

$subject = 'Intent to donate';
$patron_email = $_GET['email'];
$patron_name = $_GET['name'];
$release = $_GET['release'];
$subject = "Donation intent from $patron_name for $release";
$message = "A visitor has expressed an intent to make a donation:\n    Release: $release\n    Name: $patron_name\n    Email: $patron_email\n\n";

foreach ($_POST as $key => $value)
    $message .= "Field ".htmlspecialchars($key)." is ".htmlspecialchars($value)."\n";

$headers = 'From: donationnotifier@hotramanh.com';

try {
    $mailer->SMTPDebug = 0;
    $mailer->isSMTP();
    $mailer->Host = 'mail.hotramanh.com';
    $mailer->SMTPAuth = true;
    $mailer->Username = 'donationnotifier@hotramanh.com';
    $mailer->Password = '$3Tx6eW+PYBm';
    $mailer->SMTPSecure = 'ssl';
    $mailer->Port = 465;
    
    $mailer->setFrom('donationnotifier@hotramanh.com', 'Automatic notification');
    $mailer->addAddress('hotramanh.music@gmail.com', 'Ho Tram Anh');
    $mailer->isHTML(false);
    $mailer->Subject = $subject;
    $mailer->Body = $message;

    $mailer->send();
    $mailer->ClearAllRecipients();
    echo "MAIL HAS BEEN SENT SUCCESSFULLY";

} catch (Exception $e) {
    echo "EMAIL SENDING FAILED. INFO: " . $mailer->ErrorInfo;
}

?>
