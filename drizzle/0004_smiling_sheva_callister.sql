ALTER TABLE "stock_statistics" ALTER COLUMN "shares_held_by_institutions" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "stock_statistics" ALTER COLUMN "shares_held_by_all_insider" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "stock_statistics" ALTER COLUMN "last_split_factor" SET DATA TYPE varchar(10);