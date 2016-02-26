<?php
/**
 * Created by PhpStorm.
 * User: Work
 * Date: 2/27/15
 * Time: 3:34 PM
 */
if (isset($_SERVER['REMOTE_ADDR'])) die('Permission denied.');

// Constants for OAuth2.0 and Google Sheets access
define('CLIENT_ID', '842326339485-4qpk34mr3j9378icqm7s4pjo26804jmk.apps.googleusercontent.com'); //Client ID
define('SERVICE_ACCOUNT_NAME', '842326339485-4qpk34mr3j9378icqm7s4pjo26804jmk@developer.gserviceaccount.com'); //Email Address
define('KEY_FILE', '/var/www/scrolling-marquee/Reporting-d263195f3511.p12'); //key.p12
define('SCOPE', 'https://spreadsheets.google.com/feeds');
define('SPREADSHEET_ID', '1QG9Nlxu_wOgHXdSsJxmhosXm3b2vuxcfSSnOu1jeC9Y');
define('SHEET_NAME', 'Marquee Data');

require realpath(dirname(__FILE__) . '/class.alphadisplay.php');
require_once realpath(dirname(__FILE__) . '/SpreadsheetModel.php');

session_start();

$client = new SpreadsheetModel(CLIENT_ID, SERVICE_ACCOUNT_NAME, SCOPE, KEY_FILE);
$client->setId();

if ($client->checkTokenInSession())
    $client->setTokenFromSession();

$client->setCreds();
$client->refreshToken();
$client->getToken();
$client->updateTokenInSession();

$client->initService();
$client->getWorksheet(SPREADSHEET_ID, SHEET_NAME);
$client->getlistFeed();
$client->getData();

// alphadisplay class provided by manufacturer
$marquee = new alphadisplay();
$marquee->CheckDevice();

// set baud rate etc for communicating with scrolling marquee
$marquee->SetCommParameters(9600, 7, 'E', 1);

$marquee->Open();
$marquee->AddMode(MODE_STATIC);
$marquee->Speed(2);
foreach ($client->data as $index => $builder) {
//    $marquee->AddMode(MODE_STATIC);
//    $text = sprintf("%s\n99999999", $builder["builder"]);
    if ($builder['qtd'] != 0 && $builder['ytd'] != 0) {
        $text = sprintf("%s - %d - %d\n", $builder['builder'], $builder['qtd'], $builder['ytd']);
        $marquee->AddText($text);
//        if ($index > 3) break;
    }
}
//	$id = $p->StoreGraphic('wingding.gif'); // wingding did not work;  bigsale does
//	$id = $p->StoreAnimation('bigsale12.gif', 40);
//$marquee->AddMode(SPECIAL_WELCOME);
//$marquee->AddText('This is an extra special test');
$marquee->AddMode(SPECIAL_DRINKDRIVE);

$marquee->Finish();		// Send all the data
$marquee->Close();

echo "\nDone\n";
