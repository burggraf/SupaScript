EXTENSION = supascript
DATA = supascript--1.3.sql
 
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
