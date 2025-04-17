// L - Label, Ph - placeholder, H - header
export const translations = {
  eng: {
    loginForm: {
      formHeader: 'Log in',
      serverL: 'Server',
      serverPh: 'Enter server address',
      portL: 'Port',
      portPh: 'Enter server port',
      databaseL: 'Database',
      databasePh: 'Enter database name',
      usernameL: 'Username',
      usernamePh: 'Enter username',
      passwordL: 'Password',
      passwordPh: 'Enter password',
      formSubmit: 'Connect',
      connecting: 'Connecting',
      aboutH: 'About',
      about: `This software has been created and extended by the following people.
             - Erik Dzotsenidze (version 1)
             - Ragnar Pärnamäe (version 2)
             - Karel Markus Mulk (version 3)
             - Andres Lüiste (version 4)`,
      logout: 'Log out',
      searchDatabases: 'Search databases...',
      availableDatabases: 'Available databases',
    },
    sideBar: {
      disconnectB: 'Switch database',
      tablesH: 'Tables',
      schemaH: 'Schema',
      searchPh: 'Search',
    },
    queryBuilder: {
      queryB: 'Execute',
      querying: 'Querying',
      queriesH: 'Queries',
      columnsH: 'Columns',
      joinsH: 'Joins',
      resultH: 'Result',
      aliasH: 'Alias',
      foreignKeyH: 'Foreign key references',
      tableTh: 'Table',
      schemaTh: 'Schema',
      columnTh: 'Column/columns',
      aliasPh: 'Alias',
      filterPh: 'Filter',
      conditionH: 'Add condition',
      queryH: 'Add statement',
      joinMainTable: 'Select table',
      joinMainTableNew: 'Select new table',
      joinMainTableExisting: 'Select existing table',
      joinConditionMainColumn: 'Select column',
      joinConditionSecondaryTable: 'Select table',
      joinConditionSecondaryColumn: 'Select column',
      selectFunction: 'Select function',
      addJoin: 'Add a join',
      joinResult: 'result of previous join',
      invalidQuery: 'Invalid "SELECT" statement',
      selectType: 'Select type',
      setsH: 'Set operations',
      addSet: 'Add a set operation',
      setResult: 'result of previous set',
      setQuery: 'Select query',
      queryNamePh: 'Query name',
      query: 'Query',
      mainQuery: 'Main',
      linkSq: 'Link query',
      distinctL: 'Remove duplicate rows',
      limitL: 'Limit row number',
      distinctOnL: 'Remove duplicates',
      orderL: 'Order rows',
      ascL: 'Ascending',
      descL: 'Descending',
      groupByL: 'Group rows',
      havingL: 'Filter grouping results',
      withTiesL: 'With ties',
      // Table labels
      columnLabel: 'Column',
      aliasLabel: 'Alias',
      tableLabel: 'Table',
      aggregateLabel: 'Aggregate function',
      scalarLabel: 'Scalar function',
      sortLabel: 'Sort',
      sortOrderLabel: 'Sort order',
      showLabel: 'Show',
      removeDuplicatesLabel: 'Remove Duplicates',
      criteriaLabel: 'Criteria',
      orLabel: 'Or',
    },
    tooltips: {
      invalidFilter: 'Invalid filter condition',
      copyColumn: 'Copy column',
      removeColumn: 'Remove column',
      removeJoin: 'Remove join',
      joinType: 'Join type',
      copyTable: 'Copy table',
      removeTable: 'Remove table',
      columnAlias: 'Rename column',
      columnFilter: 'Example: :c > 10 (:c is the shorthand for the name of the column)',
      limitValue: 'Limit value',
      setType: 'Set operation type',
      linkSq: 'Link subquery to filter',
      queryName: 'Rename query',
      // Table label tooltips
      column:
        "Column or expression that will be included in the result. You can use mathematical operators and functions. Example: (price * quantity) or CONCAT(first_name, ' ', last_name). More info: https://www.postgresql.org/docs/current/sql-expressions.html",
      alias:
        'Optional name to assign to the column in the query result. Easier to reference the column in other parts of the query. More info: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-TABLE-ALIASES',
      table: 'The source table for this column. More info: https://www.postgresql.org/docs/current/ddl-basics.html',
      aggregate:
        'Functions that operate on multiple rows and return a single result, like SUM, AVG, COUNT. More info: https://www.postgresql.org/docs/current/functions-aggregate.html',
      scalar:
        'Functions that operate on a single row and return a single value, like UPPER, LOWER, LENGTH. More info: https://www.postgresql.org/docs/current/functions.html',
      sort: 'Sort the results by this column. More info: https://www.postgresql.org/docs/current/queries-order.html',
      'sort-order':
        'Numerical position for this column in multi-column sorting. More info: https://www.postgresql.org/docs/current/queries-order.html',
      show: 'Include this column in the query results. More info: https://www.postgresql.org/docs/current/queries-select-lists.html',
      'remove-duplicates':
        'Apply DISTINCT ON to this column to remove duplicate values. More info: https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT',
      criteria:
        'Filter condition for this column. Must start with an operator (=, >, <, >=, <=, LIKE, etc.). Can reference other queries using {} syntax, e.g., LIKE {Query 2}. More info: https://www.postgresql.org/docs/current/functions-comparison.html',
      'or-1':
        'Alternative filter condition using OR logic. More info: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-WHERE',
      // Switch tooltips
      distinct:
        'Use the DISTINCT clause to eliminate duplicate rows from the result. More info: https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT',
      limit:
        'Restrict the number of rows returned by the query. More info: https://www.postgresql.org/docs/current/queries-limit.html',
      limitValueD:
        'Maximum number of rows to return. More info: https://www.postgresql.org/docs/current/queries-limit.html',
      withTies:
        'Include additional rows that tie with the last row, when using ORDER BY. More info: https://www.postgresql.org/docs/current/queries-limit.html',
    },
  },
  est: {
    loginForm: {
      formHeader: 'Logi sisse',
      serverL: 'Server',
      serverPh: 'Sisesta serveri aadress',
      portL: 'Port',
      portPh: 'Sisesta serveri port',
      databaseL: 'Andmebaas',
      databasePh: 'Sisesta andmebaasi nimi',
      usernameL: 'Kasutajanimi',
      usernamePh: 'Sisesta kasutajanimi',
      passwordL: 'Parool',
      passwordPh: 'Sisesta parool',
      formSubmit: 'Sisene',
      connecting: 'Sisenen',
      aboutH: 'Teave',
      about: `Selle tarkvara on loonud ja laiendanud järgmised inimesed.
             - Erik Dzotsenidze (versioon 1)
             - Ragnar Pärnamäe (versioon 2)
             - Karel Markus Mulk (versioon 3)
             - Andres Lüiste (versioon 4)`,
      logout: 'Logi välja',
      searchDatabases: 'Otsi andmebaase...',
      availableDatabases: 'Saadaval andmebaasid',
    },
    sideBar: {
      disconnectB: 'Vaheta andmebaasi',
      tablesH: 'Tabelid',
      schemaH: 'Skeem',
      searchPh: 'Otsi',
    },
    queryBuilder: {
      queryB: 'Käivita',
      querying: 'Käivitan',
      queriesH: 'Päringud',
      columnsH: 'Veerud',
      joinsH: 'Ühendamised',
      resultH: 'Tulemus',
      aliasH: 'Alias',
      foreignKeyH: 'Välisvõtmete viited',
      tableTh: 'Tabel',
      schemaTh: 'Skeem',
      columnTh: 'Veerg/veerud',
      aliasPh: 'Alias',
      filterPh: 'Piirang',
      conditionH: 'Tingimuse lisamine',
      queryH: 'Päringu lisamine',
      joinMainTable: 'Tabeli valimine',
      joinMainTableNew: 'Vali uus tabel',
      joinMainTableExisting: 'Vali tabel',
      joinConditionMainColumn: 'Veeru valimine',
      joinConditionSecondaryTable: 'Tabeli valimine',
      joinConditionSecondaryColumn: 'Veeru valimine',
      selectFunction: 'Funktsiooni valimine',
      addJoin: 'Ühendamise lisamine',
      joinResult: 'eelmise ühenduse tulemus',
      invalidQuery: 'Vigane "SELECT" lause',
      selectType: 'Tüübi valimine',
      setsH: 'Operatsioonid hulkadega',
      addSet: 'Hulga operatsiooni lisamine',
      setResult: 'eelmise hulga tulemus',
      setQuery: 'Päringu valimine',
      queryNamePh: 'Päringu nimi',
      query: 'Päring',
      mainQuery: 'Põhipäring',
      linkSq: 'Päringu linkimine',
      distinctL: 'Eemalda korduvad read',
      limitL: 'Piira ridade arvu',
      distinctOnL: 'Eemalda kordused',
      orderL: 'Sorteeri ridu',
      ascL: 'Kasvavalt',
      descL: 'Kahanevalt',
      groupByL: 'Grupeeri ridu',
      havingL: 'Piira grupeerimise tulemusi',
      withTiesL: 'Koos seotud ridadega',
      // Table labels
      columnLabel: 'Veerg',
      aliasLabel: 'Alias',
      tableLabel: 'Tabel',
      aggregateLabel: 'Agregaat',
      scalarLabel: 'Skalaarfunktsioon',
      sortLabel: 'Sorteerimine',
      sortOrderLabel: 'Sorteerimise järjekord',
      showLabel: 'Näita',
      removeDuplicatesLabel: 'Eemalda kordused',
      criteriaLabel: 'Kriteeriumid',
      orLabel: 'Või',
    },
    tooltips: {
      invalidFilter: 'Kehtetu tingimuse sisu',
      copyColumn: 'Veeru kopeerimine',
      removeColumn: 'Veeru eemaldamine',
      removeJoin: 'Ühendamise eemaldamine',
      joinType: 'Ühendamise tüüp',
      copyTable: 'Tabeli kopeerimine',
      removeTable: 'Tabeli eemaldamine',
      columnAlias: 'Veeru ümbernimetamine',
      columnFilter: 'Näide: :c > 10 (:c on veeru nime lühend)',
      limitValue: 'Ridade arvu piirangu väärtus',
      setType: 'Hulga tüüp',
      linkSq: 'Alampäringu linkimine filtrile',
      queryName: 'Päringu ümbernimetamine',
      // Table label tooltips
      column:
        "Veerg või avaldis, mis lisatakse tulemustesse. Võite kasutada matemaatilisi operaatoreid ja funktsioone. Näide: (hind * kogus) või CONCAT(eesnimi, ' ', perekonnanimi). Rohkem infot: https://www.postgresql.org/docs/current/sql-expressions.html",
      alias:
        'Valikuline nimi, mis antakse veerule päringu tulemustes. Lihtsustab veerule viitamist päringu teistes osades. Rohkem infot: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-TABLE-ALIASES',
      table: 'Selle veeru lähtetabel. Rohkem infot: https://www.postgresql.org/docs/current/ddl-basics.html',
      aggregate:
        'Funktsioonid, mis töötavad mitme reaga ja tagastavad ühe tulemuse, nagu SUM, AVG, COUNT. Rohkem infot: https://www.postgresql.org/docs/current/functions-aggregate.html',
      scalar:
        'Funktsioonid, mis töötavad ühe reaga ja tagastavad ühe väärtuse, nagu UPPER, LOWER, LENGTH. Rohkem infot: https://www.postgresql.org/docs/current/functions.html',
      sort: 'Sorteeri tulemused selle veeru järgi. Rohkem infot: https://www.postgresql.org/docs/current/queries-order.html',
      'sort-order':
        'Numbriline positsioon sellele veerule mitme veeru järgi sorteerimisel. Rohkem infot: https://www.postgresql.org/docs/current/queries-order.html',
      show: 'Lisa see veerg päringu tulemustesse. Rohkem infot: https://www.postgresql.org/docs/current/queries-select-lists.html',
      'remove-duplicates':
        'Rakenda DISTINCT ON sellele veerule, et eemaldada duplikaadid. Rohkem infot: https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT',
      criteria:
        'Filtreerimistingimus sellele veerule. Peab algama operaatoriga (=, >, <, >=, <=, LIKE jne). Saate viidata teistele päringutele kasutades {} süntaksit, nt LIKE {Päring 2}. Rohkem infot: https://www.postgresql.org/docs/current/functions-comparison.html',
      'or-1':
        'Alternatiivne filtreerimistingimus kasutades OR loogikat. Rohkem infot: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-WHERE',
      // Switch tooltips
      distinct:
        'Kasuta DISTINCT klauslit, et eemaldada duplikaatread tulemusest. Rohkem infot: https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT',
      limit:
        'Piira päringu poolt tagastatavate ridade arvu. Rohkem infot: https://www.postgresql.org/docs/current/queries-limit.html',
      limitValueD:
        'Maksimaalne tagastatavate ridade arv. Rohkem infot: https://www.postgresql.org/docs/current/queries-limit.html',
      withTies:
        'Kaasa täiendavad read, mis on seotud viimase reaga, kui kasutatakse ORDER BY. Rohkem infot: https://www.postgresql.org/docs/current/queries-limit.html',
    },
  },
};

export const languages: { code: 'eng' | 'est'; name: string }[] = [
  { code: 'eng', name: 'English' },
  { code: 'est', name: 'Eesti' },
];
