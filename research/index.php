<?php

require_once 'Algorithms.php';
require_once 'PrimeFinder.php';

$size = 10;
$size2 = 10;

$algo1 = new Algorithms($size);
$algo2 = new Algorithms($size2, true);

//$primes = new PrimeFinder($size);

header('Content-type: text/plain');

/*$before = microtime(true);
$slower = $primes->find(true);
echo 'slower function took: ' . $a = number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

echo PHP_EOL;

$before = microtime(true);
$faster = $primes->find();
echo 'faster function took: ' . $b = number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

echo PHP_EOL;

echo 'faster is ' . number_format(100 * (($a - $b) / $a), 2) . '% faster' . PHP_EOL;

echo PHP_EOL;

echo 'results for slower and faster are equal?  ' . (($slower === $faster) ? 'true' : 'false') . PHP_EOL;*/


$before = microtime(true);

echo 'Binary search algo1 result: ' . $algo1->search(rand(0, $size)) . PHP_EOL;

echo 'function took: ' . number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

echo PHP_EOL;

/*$before = microtime(true);

echo 'Linear search algo2 result: ' . $algo2->search(rand(0, $size), false) . PHP_EOL;

echo 'function took: ' . number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

echo PHP_EOL;*/

$before = microtime(true);

echo 'Sorting algo2...' . PHP_EOL;

$algo2->sort();

echo 'function took: ' . number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

echo PHP_EOL;

$before = microtime(true);

echo 'Binary search algo2 result: ' . $algo2->search(rand(0, $size2)) . PHP_EOL;

echo 'function took: ' . number_format(( microtime(true) - $before), 4) . ' seconds' . PHP_EOL;

exit;