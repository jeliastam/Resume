<?php

namespace model\simply_select;

class product_images extends simply_select
{

    //constructor
    public function __construct($data_arr = null)
    {
        parent::__construct($data_arr);
    }

    //function to get list of product shots and their images
    public function getProductImageList()
    {
        $client_product_id  = $this->data_arr['client_product_id'];
        $language_id        = $this->data_arr['language_id'];
        $sql_str = "CALL " . $this->db . ".product_image_shotList(%d, %d)";
        $data = $this->db_conn->safeQuery($sql_str, [$client_product_id, $language_id], 'multi');
		$primary = session_id() . ':' . $this->data_arr['client_product_id'];
		if ($data !== NULL)
			foreach($data as &$image_item) {
				if ($image_item['product_image_file_name'] !== NULL) {
					$image_item['product_image_file_name'] = str_replace('.png', '', $image_item['product_image_file_name']);		// remove .png extension
					$image_item['authentication'] = md5($primary . ':' . $image_item['product_product_image_shot_id']);		// token to validate deletion.  Makes sure you can only delete something that belongs to you
				}
			}
		return $data;
    }

	private function ClientByClientProductID($client_product_id) {
		$data = $this->db_conn->SafeQuery("select client_id, product_id from _client_x_product where client_product_id=%d", $client_product_id, 'single');
		$this->db_conn->checkError();
		return $data;
	}

	
    public function addOrUpdateImageShot()
    {
        $product_image_shot_id    = $this->data_arr['image_shot_id'];
        $product_image_shot_name  = $this->data_arr['image_shot_name'];
        $product_image_shot_order = 0;
        $client_product_id        = $this->data_arr['product_id'];
        $language_id              = $this->data_arr['language_id'];
        $client_id                = $this->data_arr['client_id'];
        $user_id                  = $this->user_id;

        if (!$product_image_shot_id) {
            // add
            $sql = "call {$this->db}.product_image_shotAdd(%d, %d, %s, %d, %d)";
            return $this->db_conn->safeQuery($sql, [$client_id, $language_id, $product_image_shot_name, $product_image_shot_order, $user_id], 'none');
        } else {
            // update
            $sql = "call {$this->db}.product_image_shotUpdate(%d, %s, %d, %d)";
            return $this->db_conn->safeQuery($sql, [$product_image_shot_id, $product_image_shot_name, $product_image_shot_order, $user_id], 'none');
        }
    }

    public function removeProductImageShot()
    {
        $product_image_shot_id    = $this->data_arr['product_image_shot_id'];
        $language_id              = $this->data_arr['language_id'];
        $client_product_id        = $this->data_arr['client_product_id'];
        $client_id                = $this->data_arr['client_id'];
        $status                   = [
            'delete_images'     => []
        ];

        // find all product_x_product_image_shots that use this product_image_shot_id
        $sql               = "call {$this->db}._product_x_product_image_shotListByShot(%d, %d)";
        $to_be_deleted_arr = $this->db_conn->safeQuery($sql, [$client_id, $product_image_shot_id], 'multi');

        // delete the associated file for each one
        if (is_array($to_be_deleted_arr) &&
            !empty($to_be_deleted_arr))
        {
            foreach ($to_be_deleted_arr as $image_shot) {
                $folder_name = "product_images/" . $client_id . "/" . $image_shot['product_id'] . "/";  // TODO: find correct folder!!
                $status['delete_images'][$image_shot['product_id']] = $this->deleteFile($image_shot['product_image_file_name'], $folder_name);
            }
        }

        // remove the entries from product_x_product_image_shot
        $sql                                          = "call {$this->db}._product_x_product_image_shotDeleteByShot(%d, %d)";
        $status['remove_product_product_image_shot']  = $this->db_conn->safeQuery($sql, [$client_id, $product_image_shot_id], 'none');


        // then if all is well remove the entry from product_image_shot
        if ($status['remove_product_product_image_shot']) {
            $sql = "call {$this->db}.product_image_shotDelete(%d)";

            $status['remove_product_image_shot'] = $this->db_conn->safeQuery($sql, $product_image_shot_id, 'none');
        }

        return $status;
    }

    // get the swatches assigned to this product/client combination
    public function getAssignedProductSwatchList()
    {
        $client_product_id = $this->data_arr['client_product_id'];
        $language_id       = $this->data_arr['language_id'];

        $sql_str = "CALL " . $this->db . "._product_x_product_swatchListByProduct(%d, %d)";

        return $this->db_conn->SafeQuery($sql_str, array($client_product_id, $language_id), 'multi');
    }

    //function to get list of product swatches
    public function getProductSwatchList()
    {
        $client_id       = $this->data_arr['client_id'];
        $manufacturer_id = $this->data_arr['manufacturer_id'];
        $language_id     = $this->data_arr['language_id'];

        $sql_str = "CALL " . $this->db . ".product_swatchList(%d, %d, %d)";

        return $this->db_conn->SafeQuery($sql_str, [$manufacturer_id, $client_id, $language_id], 'multi');
    }

    //function to add a product image
    public function addProductSwatch()
    {
        $client_id          = $this->data_arr['client_id'];
        $manufacturer_id    = $this->data_arr['manufacturer_id'];
        $language_id        = $this->data_arr['language_id'];
        $swatch_name        = $this->data_arr['swatch_name'];
        $swatch_color       = $this->data_arr['swatch_color'];

        $sql_str = "CALL " . $this->db . ".product_swatchAdd(%d, %d, %d, %s, %s, %d)";

        $result = $this->db_conn->SafeQuery($sql_str, array($manufacturer_id, $client_id, $language_id, $swatch_name, $swatch_color, $this->user_id), 'single');
        $result['manufacturer'] = intval($manufacturer_id);
        return $result;
    }

    public function deleteProductSwatch()
    {

        $product_swatch_id = $this->data_arr['product_swatch_id'];

        $sql_str = "CALL " . $this->db . ".product_swatchDelete(%d)";

        return $this->db_conn->SafeQuery($sql_str, $product_swatch_id, 'single');
    }

    //function to add a product swatch to a product
    public function assignProductSwatchToProduct()
    {

        $created_user_id = $this->user_id;
        $client_product_id = $this->data_arr['client_product_id'];
        $product_swatch_id = $this->data_arr['product_swatch_id'];
		
		if (empty($product_swatch_id)) {		// no swatch selected - can't add it
			return array('product_product_swatch_id' => -1);
		}

        $sql_str = "CALL " . $this->db . "._product_x_product_swatchAdd(%d, %d, %d)";

        return $this->db_conn->SafeQuery($sql_str, array($client_product_id, $product_swatch_id, $created_user_id), 'single');
    }

    //function to add a product swatch to a product
    public function unassignProductSwatchFromProduct()
    {

        $product_product_swatch_id = $this->data_arr['product_product_swatch_id'];

        $sql_str = "CALL " . $this->db . "._product_x_product_swatchDelete(%d)";

        return $this->db_conn->SafeQuery($sql_str, $product_product_swatch_id, 'none');
    }

    //function to set the shown in pictures swatch
    public function setShownProductSwatchForProduct()
    {

        $product_product_swatch_id = $this->data_arr['product_product_swatch_id'];

        $sql_str = "CALL " . $this->db . "._product_x_product_swatchSetShown(%d)";

        return $this->db_conn->SafeQuery($sql_str, $product_product_swatch_id, 'none');

    }

    //function to update a product shot with an image
    public function setProductImage()
    {

        $product_image_shot_id = $this->data_arr['product_image_shot_id'];
        $product_image_file_name = $this->data_arr['product_image_file_name'];
        $client_product_id = $this->data_arr['client_product_id'];
		$client_info = $this->ClientByClientProductID($client_product_id);

        $sql_str = "CALL " . $this->db . "._product_x_product_image_shotAdd(%d, %d, %s, %d)";

        $return_obj = $this->db_conn->SafeQuery($sql_str, array($product_image_shot_id, $client_product_id, $product_image_file_name, $this->user_id), 'single');
		$msg = $this->db_conn->getLastError();
		if (!empty($msg)) $return_obj['status'] = $msg;

        //delete old file
        if ($return_obj['product_image_file_name']) {
            $folder_name = "product_images/" . $client_info['client_id'] . "/" . intval($client_product_id) . "/";
            $this->deleteFile($return_obj['product_image_file_name'], $folder_name);
        }

        return $return_obj;
    }

    public function deleteProductImage()
    {
        $client_product_id = $this->data_arr['client_product_id'];
		$client_info = $this->ClientByClientProductID($client_product_id);
        $product_product_image_shot_id = $this->data_arr['product_product_image_shot_id'];
		$authentication = $this->data_arr['authentication'];

		$primary = session_id() . ':' . $client_product_id . ':' . $product_product_image_shot_id;
		if ($authentication != md5($primary)) {
			return array('status' => 'bad authentication');
		}
		
		$sql = "select product_image_file_name from {$this->db}._product_x_product_image_shot where product_product_image_shot_id=%d";
		$olddata = $this->db_conn->SafeQuery($sql, $product_product_image_shot_id, 'single');
		$msg = $this->db_conn->getLastError();
		if (!empty($msg)) {
			return array('status' => $msg);
		}
		if ($olddata !== NULL) {
			$folder_name = "product_images/" . $client_info['client_id'] . "/" . intval($client_product_id) . "/";
			$product_image_file_name = $olddata['product_image_file_name'];
			$this->deleteFile($product_image_file_name, $folder_name);
			$sql_str = "CALL " . $this->db . "._product_x_product_image_shotDelete(%d)";
			return $this->db_conn->SafeQuery($sql_str, $product_product_image_shot_id, 'none');
		} else {
			return array('status' => 'product image not found');
		}
    }
}