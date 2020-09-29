Or
^^^^^^^^^^

``And`` and ``Or`` can be used to create more complex validation check

::

    - do: or
      validate:
        - do: title
          begins_with: '[WIP]'
        - do: label
          must_include: 'Ready to Merge'

you can also creat nested ``And`` and ``Or``

::

    - do: and
      validate:
        - do: or
          validate:
            - do: title
              begins_with: '[WIP]'
            - do: label
              must_include: '[WIP]'
        - do: label
          must_include: 'Ready to Merge'
