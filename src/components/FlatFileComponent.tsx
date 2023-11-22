import { ISpace, makeTheme, useSpace } from "@flatfile/react";
import { FC, useMemo } from "react";

const FlatFileComponent: FC<{ data: string[]; closeSpace: () => void }> = (
    props
  ) => {
    const { data, closeSpace } = props;
    const theme = useMemo(() => ({
        name: "Dynamic Space",
        environmentId: process.env.NEXT_PUBLIC_FLAT_ENVIRONMENT_ID,
        publishableKey: process.env.NEXT_PUBLIC_FLAT_PUBLISHABLE_KEY!,
        themeConfig: makeTheme({ primaryColor: "#546a76", textColor: "#fff" }),
        workbook: {
          name: "Contacts Workbook",
          sheets: [
            {
              name: "ContactSheet",
              slug: "ContactSheet",
              fields: data.map((p, index) => ({
                key: String(index),
                type: "string",
                label: p,
              })),
            },
          ],
          actions: [
            {
              label: "Submit",
              operation: "contacts:submit",
              description: "Would you like to submit your workbook?",
              mode: "background",
              primary: true,
              confirm: true,
            },
          ],
        },
      } as ISpace), [data]);
  
    const space = useSpace({
      ...theme,
      closeSpace: {
        operation: "contacts:close",
        onClose: () =>{
          console.log('onClose --- 0000 --- 8888 ---- onClose')
          closeSpace()
        },
      },
    });
  
    return <>{space}</>;
    
  };

  export default FlatFileComponent;