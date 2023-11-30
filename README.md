System demonstracyjny wejść i wyjść w obiektach handlowych API
==============================================================

Projekt został zrobiony za pomocą:

- NodeJS 21.2

- Mysql 8.1.0 x64

Przed uruchomieniem projektu trzeba założyć bazę danych o nazwie "system_nodejs_api" i uruchomić skrypt SQL w pliku system_nodejs_api.sql w folderze "sql" 
w głównym folderze aplikacji na tej bazie danych. Do projektu trzeba dograć biblioteki NodeJS. W pliku main.js w głównym folderze we fragmencie kodu jest
konfiguracja bazy danych:

const host = 'localhost';
const user = 'root';
const password = '';
const database = 'system_nodejs_api';

W zmiennej host podajemy nazwę hosta, w zmiennej user nazwę użytkownika, w zmiennej password hasło użytkownika i w zmiennej database nazwę bazy danych. 
Aplikację na serwerze NodeJS uruchamiamy poleceniem:

node main.js
