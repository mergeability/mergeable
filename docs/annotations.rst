.. _annotations-page:
Annotations
=====================================

Annotations allows the use of dynamic values in your recipes.

To bypass the annotation, use ``\`` prefix. (i.e ``\@author`` will be replaced with literal `@author`)

::

   @author : replaced with the login of creator of issues/PR
   @sender : replaced with the login of initiator of the ocurred event
   @bot : replaced with the name of the Mergeable bot
   @repository : replaced with the name of repository of issues/PR
   @action : replaced with action of the ocurred event


Actions supported:
::

    'assign', 'comment', 'checks'


.. hint::
    Don't see any annotation that fits your needs? Let us know by creating an `issue <https://github.com/mergeability/mergeable/issues/new>`_ on github.


