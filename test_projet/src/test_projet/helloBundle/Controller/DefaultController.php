<?php

namespace test_projet\helloBundle\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('helloBundle:Default:index.html.twig');
    }
}
