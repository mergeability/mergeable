And
^^^^^^^^^^

``And``, ``Or``, and ``Not`` can be used to create more complex validation/filter check

::

  filter:
    - do: and
      filter:
        - do: author
          must_include: 'user-1'
        - do: repository
          visibility: public
  validate:
    - do: and
      validate:
        - do: title
          begins_with: '[WIP]'
        - do: label
          must_include: 'Ready to Merge'

you can also create nested ``And``, ``Or``, and ``Not``

::

  filter:
    - do: and
      filter:
        - do: or
          filter:
            - do: author
              must_include: 'user-1'
            - do: author
              must_include: 'user-2'
        - do: repository
          visibility: public
  validate:
    - do: and
      validate:
        - do: or
          validate:
            - do: title
              begins_with: 'feat:'
            - do: label
              must_include: 'feature'
        - do: label
          must_include: 'Ready to Merge'
