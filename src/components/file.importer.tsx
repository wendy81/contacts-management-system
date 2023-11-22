import React, { FC, useState } from "react";
import FlatFileComponent from "./FlatFileComponent"

const FileImporterComponent: FC<{ data: string[] }> = (props) => {
    const { data } = props;
    const [showSpace, setShowSpace] = useState(false);
  
    return (
      <div className="flex justify-center py-5">
        <button
          className="bg-violet-900 p-3 rounded-3xl"
          onClick={() => {
            setShowSpace(!showSpace);
          }}
        >
          Import Contacts
        </button>
        {showSpace && (
          <div className="fixed w-full h-full left-0 top-0 z-50 text-black">
            <div className="w-[80%] m-auto top-0 absolute left-0 -translate-x-0 -translate-y-0 text-black space-modal">
              <FlatFileComponent
                data={data}
                closeSpace={() => {
                  setShowSpace(!showSpace)
                }
                }
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default FileImporterComponent;

  