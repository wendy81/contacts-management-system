'use client'
import React,{useCallback, useState,useEffect} from "react";
import Spreadsheet from "react-spreadsheet";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import { createSupabase } from "@/helpers/supabase";
import dynamic from "next/dynamic";

const supabase = createSupabase(process.env.NEXT_PUBLIC_ANON_KEY!);
const FileImporterComponent = dynamic(() => import("@/components/file.importer"), {
  ssr: false,
});

const Home= ()=>{
  const [data,setData] = useState<{value:string}[][]>([]);

  const debouncer = useDebouncedCallback((newData:any, diff)=>{
    setData((oldData)=>{
      // update the server with our new data
      updateServer(diff);
      return newData;
    });
  },500);

  const setNewData = (newData: {value:string}[][], ignoreDiff?:boolean)=>{
    const diff = findDiff(data,newData);
    if(diff || ignoreDiff){
      return debouncer(newData, diff)
    }
  }

  const findDiff = useCallback((
    oldData:{value:string}[][], newData:{value:string}[][]
  )=>{
    for(let i = 0; i < oldData.length; i++){
      for(let y = 0; y < oldData[i].length; y++){
        if(newData[i] && newData[i][y]){
          // debugger
          if(oldData[i][y] !== newData[i][y]){
            // old !== new, then set new data
            return {
              oldValue: oldData[i][y] ? oldData[i][y].value : '',
              value: newData[i][y] ? newData[i][y].value : '',
              row:i,
              col:y
            }
          }
        }
      }
    }
  },[])

  // Add a new column
const addCol = useCallback(() => {
  setNewData(
    data.length === 0
      ? [[{ value: "" }]]
      : data.map((p: any) => [...p, { value: "" }]),
    true
  );
}, [data]);

// Add a new row
const addRow = useCallback(() => {
  setNewData(
    [...data, data?.[0]?.map(() => ({ value: "" })) || [{ value: "" }]],
    true
  );
}, [data]);

// Remove a column by index
const removeCol = useCallback(
  (index: number) => (event: any) => {
    // debugger
    setNewData(
      data.map((current) => {
        return [
          ...current.slice(0, index),
          ...current.slice((index || 0) + 1),
        ];
      }),
      true
    );
    event.stopPropagation();
  },
  [data]
);

// Remove a row by index
const removeRow = useCallback(
  (index: number) => (event: any) => {
    debugger
    setNewData(
      [...data.slice(0, index), ...data.slice((index || 0) + 1)],
      true
    );
    event.stopPropagation();
  },
  [data]
);

const updateServer = useCallback(
  (serverData?: { value: string; col: number; row: number }) => {
    if (!serverData) {
      return;
    }
    console.log(serverData);
    return axios.post("/api/update-record", serverData,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  []
);

useEffect(() => {
  supabase
    .channel("any")
    .on<any>(
      "postgres_changes",
      { event: "*", schema: "public", table: "users" },
      (payload) => {
        console.log(payload.new);
        setData((odata) => {
          const totalRows =
            payload?.new?.row + 1 > odata.length
              ? payload.new.row + 1
              : odata.length;

          const totalCols =
            payload.new?.column + 1 > odata[0].length
              ? payload.new?.column + 1
              : odata[0].length;

          return [...new Array(totalRows)].map((_, row) => {
            return [...new Array(totalCols)].map((_, col) => {
              if (payload.new.row === row && payload.new?.column === col) {
                return { value: payload?.new?.value || "" };
              }

              return { value: odata?.[row]?.[col]?.value || "" };
            });
          });
        });
      }
    )
    .subscribe();
}, []);

return (
  <>
  {!!data.length && <FileImporterComponent data={data[0].map((p) => p.value)} />}
  <div className="flex justify-center items-stretch">
    <div className="flex flex-col">
      <Spreadsheet
      //@ts-ignore
        columnLabels={data?.[0]?.map((d, index) => (
          <div
            key={index}
            className="flex justify-center items-center space-x-2"
          >
            <div>{String.fromCharCode(64 + index + 1)}</div>
            <div
              className="text-xs text-red-500"
              onClick={removeCol(index)}
            >
              X
            </div>
          </div>
        ))}
        //@ts-ignore
        rowLabels={data?.map((d, index) => (
          <div
            key={index}
            className="flex justify-center items-center space-x-2"
          >
            <div>{index + 1}</div>
            <div
              className="text-xs text-red-500"
              onClick={removeRow(index)}
            >
              X
            </div>
          </div>
        ))}
        darkMode={true}
        data={data}
        className="w-full"
        // @ts-ignore
        onChange={setNewData}
      />
      <div
        onClick={addRow}
        className="bg-[#060606] border border-[#ff6600] border-t-0 mb-[6px] flex justify-center py-1 cursor-pointer"
      >
        +
      </div>
    </div>
    <div
      onClick={addCol}
      className="bg-[#060606] border border-[#00ff00] border-l-0 mb-[6px] flex items-center px-3 cursor-pointer"
    >
      +
    </div>
  </div>
</>
)
}

export default Home