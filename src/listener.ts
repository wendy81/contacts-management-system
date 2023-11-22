import { FlatfileEvent, Client } from "@flatfile/listener";
import api from "@flatfile/api";
import { createSupabase } from "./helpers/supabase";

const supabase = createSupabase(process.env.SECRET_KEY!);

export default function flatfileEventListener(listener: Client) {
  listener.filter({ job: "workbook:contacts:submit" }, (configure) => {
    configure.on(
      "job:ready",
      async ({ context: { jobId, workbookId }, payload }: FlatfileEvent) => {
        const row = await supabase
          .from("users")
          .select("row")
          .order("row", { ascending: false })
          .limit(1);

        let startRow = row.data?.length ? row.data[0].row + 1 : 0;

        const { data: sheets } = await api.sheets.list({ workbookId });
        // loading all the records from the client
        const records =
          (await api.records.get(sheets[0].id))?.data?.records || [];
        let index = 1;
        try {
          for (const record of records) {

            // information the client about the amount of contacts loaded
            await api.jobs.ack(jobId, {
              info: "Loading contacts",
              progress: Math.ceil((index / records.length) * 100),
            });

            // inserting the row to the table (each cell has a separate insert)
            await Promise.all(
              Object.keys(record.values).map((key) => {
                console.log({
                  row: startRow,
                  column: +key,
                  value: record.values[key].value,
                });
                return supabase
                  .from("users")
                  .upsert(
                    {
                      row: startRow,
                      column: +key,
                      value: record?.values?.[key]?.value || "",
                    },
                    {
                      onConflict: "row,column",
                    }
                  )
                  .select();
              })
            );
            startRow++;
            index++;
          }
        } catch (err) {
            // failing the job in case we get an error
            await api.jobs.fail(jobId, {
                info: 'Could not load contacts'
            });

            return ;
        }

        // Finishing the job
        await api.jobs.complete(jobId, {
          outcome: {
            message: "Loaded all contacts!",
          },
        });
      }
    );
  });
}