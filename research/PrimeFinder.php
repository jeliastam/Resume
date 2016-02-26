<?php

class PrimeFinder
{

    public $max;
    public $array = [];
    public $array_count = 0;

    public function __construct($max = 1000) {
        $this->max = $max;
        $this->__generateArray($max);
    }

    private function __generateArray($size)
    {
        // create an array filled with true values (innocent until proven guilty!!)
        $this->array = array_fill(0, $size, 1);
        $this->array_count = $size - 1;
    }

    public function find($slower = false)
    {
        if ($slower) {
            $this->__sievePrimes($this->array);
        } else {
            $this->__sievePrimesFaster($this->array);
        }

        return $this->array;
    }

    private function __sievePrimesFaster(&$list)
    {
        // start at first prime
        $i = 2;
        $sqrt_max = sqrt($this->max);


        while ($i <= $this->max) {
            //if current element is true, its prime, use it for sieve
            if ($list[$i] == 1) {
//                echo $i;
                // set second counter to $i^2 to check if proceeding numbers are divisible
                // non primes will be removed by a factor that is less than sqrt($i)
                $j = pow($i, 2);

                // only check upto sqrt(max) since composites will have a factor
                // less than sqrt(max) since n = pq
                while (pow($j, 2) <= $sqrt_max) {
                    //NOT A PRIME, GUILTY!!!
                    $list[$j] = 0;
                    // increment by $i
                    $j += $i;
                }
            }

            // skip all evens after 2
            if (++$i % 2 == 0) {
                $i++;
            }
        }
    }

    private function __sievePrimes(&$list)
    {

//        echo implode(', ', $list);
        // start at first prime
        $i = 2;

        while ($i <= $this->max) {
            //if current element is true, its prime, use it for sieve
            if ($list[$i] == 1) {
//                echo $i;
                // set second counter to $i^2 to check if proceeding numbers are divisible
                // non primes will be removed by a factor that is less than sqrt($i)
                $j = pow($i, 2);

                while ($j <= $this->max) {
                    //NOT A PRIME, GUILTY!!!
                    $list[$j] = 0;
                    // increment by $i
                    $j += $i;
                }
            }


            $i++;
        }
    }
}