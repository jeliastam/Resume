<?php

/**
 * Created by PhpStorm.
 * User: jeliastam
 * Date: 9/12/15
 * Time: 12:39 PM
 */


class Algorithms
{
    public $array = [];
    public $array_count = 0;
    public $target;
    public $found = 0;

    public function __construct($size = 100, $randomize = false, $target = null)
    {
        $this->__generateArray($size, $randomize);
        if ($target) {
            $this->target = $target;
        }
    }

    private function __generateArray($size, $randomize)
    {
        $this->array = range(0, $size);
        $this->array_count = $size;

        if ($randomize) {
            shuffle($this->array);
        }
    }

    public function sort()
    {
        $this->array = $this->__quickSort($this->array);
    }

    private function __quickSort($array)
    {
        if (count($array) == 0) {
            return $array;
        }

        $left = $right = [];
        $pivot = $array[0];
        $count = count($array);

        for ($i = 1 ; $i < $count ; $i++) {
            if ($array[$i] < $pivot) {
                $left[] = $array[$i];
            } else {
                $right[] = $array[$i];
            }
        }

        return array_merge($this->__quickSort($left), [$pivot], $this->__quickSort($right));
    }

    public function search($x = null, $binary = true)
    {
        // if no search term specified
        if (!$x) {
            // check if it was previously set
            if (!$this->target) {
                //if not, error and exit
                echo 'please set a target.' . PHP_EOL;
                exit;
            }
        } else {
            // else set target to term
            $this->__setTarget($x);
        }

        $this->found = 0;

        if ($binary) {
            $res = $this->__binarySearch($this->array, 0, $this->array_count - 1);
        } else {
            $res =  $this->__linearSearch();
        }

        if ($res > 0) {
            return 'target: ' . $this->target . ' @ position:' . $res . ' value : ' . $this->array[$res];
        }

        print_r($this->array);
        return 'target: ' . $this->target . ' @ Term not found!';
    }

    private function __linearSearch()
    {
        for ($i = 0 ; $i < $this->array_count ; $i++) {
            if ($this->array[$i] == $this->target) {
                $this->found = $i;
                return $i;
            }
        }

        return -1;
    }

    private function __binarySearch($array, $left, $right)
    {
        if ($left > $right) {
            return -1;
        }

        $mid = ($left + $right) >> 1;

        if ($array[$mid] == $this->target) {
            $this->found = $mid;
            return $mid;
        } elseif ($array[$mid] < $this->target) {
            $left = $mid + 1;
        } else {
            $right = $mid - 1;
        }
        return $this->__binarySearch($array, $left, $right);

    }

    private function __setTarget($x)
    {
        $this->target = $x;
    }

    public function toString($range = null)
    {
        if ($range) {
            $output_array = array_slice($this->array, $range[0], $range[1]);
        } else {
            $output_array = $this->array;
        }
        return implode(', ', $output_array);
    }
}