<?php

namespace test_projet\helloBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class TestController extends Controller
{
    function indexAction(){
    	  return $this->render('helloBundle:Connecte:index.html.twig');
     }
}