# CHANGELOG
## 1.4
### Documentation Updated 01 May 2021
- Major overhaul of the README.md file
### Fixed
- added `ALTER PUBLICATION supabase_realtime ADD TABLE supascript_log` so log file can be queried with the realtime engine
## 1.3
### Fixed
- better handling for logging of the current query name (function name)
### New
- added EASY-INSTALL-V1.3.SQL for quick copy-paste installation into Supabase
- added package.json for publishing to npm
## 1.2
### New
- added `console` object to log debug objects to `SUPASCRIPT_LOG` table
    - console.log()
    - console.info()
    - console.warn()
    - console.error()
    - console.assert()
    - console.time()
    - console.timeEnd()
## 1.1
### New
- added `require("http")` built-in module to handle web requests
