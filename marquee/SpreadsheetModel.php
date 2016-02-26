<?php

/**
 * Created by PhpStorm.
 * User: Work
 * Date: 3/2/15
 * Time: 3:45 PM
 */
use Google\Spreadsheet\DefaultServiceRequest;
use Google\Spreadsheet\ServiceRequestFactory;

class SpreadsheetModel
{
    public $data = [];
    private $spreadsheet = '';
    private $worksheet = '';
    private $worksheetFeed = '';
    private $listFeed = [];

    function __construct($id, $account, $scope, $key)
    {
        require_once realpath(dirname(__FILE__) . '/../../simply_core/google_api/autoload.php');
        require_once realpath(dirname(__FILE__) . '/vendor/autoload.php');

        $this->client = new Google_Client();
        $this->key = file_get_contents($key);
        $this->account = $account;
        $this->id = $id;
        $this->scope = $scope;
        $this->token = isset($_SESSION['token']) ? $_SESSION['token'] : new stdClass();
        $this->serviceRequest = new stdClass();
        $this->spreadsheetService = new stdClass();
    }

    function checkTokenInSession()
    {
        // check if oauth token is already set
        return isset($_SESSION['token']);
    }

    function setTokenFromSession()
    {
        $this->client->setAccessToken($_SESSION['token']);
        return;
    }

    function setCreds()
    {
        // create credentials
        $this->client->setAssertionCredentials(new Google_Auth_AssertionCredentials(
            $this->account,
            array($this->scope),
            $this->key
        ));
        return;
    }

    function setId()
    {
        $this->client->setClientId($this->id);
        return;
    }

    function refreshToken()
    {
        if ($this->client->getAuth()->isAccessTokenExpired()) {
            $this->client->getAuth()->refreshTokenWithAssertion();
        }
        return;
    }

    function getToken()
    {
        $this->token = json_decode($this->client->getAccessToken());
        return;
    }

    function updateTokenInSession()
    {
        if (isset($this->token->access_token))
            $_SESSION['token'] = $this->token->access_token;

        return;
    }

    function initService()
    {
        $this->serviceRequest = new DefaultServiceRequest($this->token->access_token);
        ServiceRequestFactory::setInstance($this->serviceRequest);

        $this->spreadsheetService = new Google\Spreadsheet\SpreadsheetService();

        return;
    }

    function getWorksheet($id, $sheetName)
    {
        try {
            $this->spreadsheet = $this->spreadsheetService->getSpreadsheetById($id);
            $this->worksheetFeed = $this->spreadsheet->getWorksheets();
            $this->worksheet = $this->worksheetFeed->getByTitle($sheetName);
        } catch (Exception $e) {
            printf("error: %s \n", $e->getMessage());
        }

        return;
    }

    function getlistFeed()
    {
        $this->listFeed = $this->worksheet->getListFeed();
    }

    function getData()
    {
        foreach ($this->listFeed->getEntries() as $entry) {
            $this->data[] = $entry->getValues();
        }
    }
}