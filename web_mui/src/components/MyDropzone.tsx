import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../api/api";
import toast from "react-hot-toast";
import _ from "lodash";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";

interface MyDropzoneProps {
  getBoletos: Function;
  empty: boolean;
}

export function MyDropzone(props: MyDropzoneProps) {
  const { getBoletos, empty } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [totalToUpload, setTotalToUpload] = useState(0);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const prevTotalUploaded = useRef(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {    
    setIsLoading(true);
    setTotalToUpload(acceptedFiles.length);
    setTotalUploaded(0);
    prevTotalUploaded.current = 0;
    var count = 0;
    acceptedFiles.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      api
        .post("/addBoleto", data, { onUploadProgress: uploadProgress })
        .catch((error) => {
          if (error.response) {
            toast.error(`${error.response.data} \n(${_.truncate(file.name)})`);
          }
        })
        .then(() => {
          if (++count === acceptedFiles.length) {
            getBoletos();
            setIsLoading(false);
          }
        });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } =
    useDropzone({
      accept: { "application/pdf": [] },
      onDrop,
      disabled: isLoading,
    });

  return (
    <Grid
      item
      component="div"
      sx={{
        border: "2px dashed",
        borderColor: isDragAccept ? "#007474" : "#ddd",
        backgroundColor: isDragAccept ? "azure" : "inherit",
        borderRadius: "4px",
        transition: "height 0.2s ease",
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      <Typography
        variant="h6"
        sx={{
          display: "flex",
          color: "#999",
          justifyContent: "center",
          alignItems: "center",
          p: "15px 0",
          m: 0,
          height: empty ? "75vh" : "auto",
        }}
      >
        {isLoading ? (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              variant="determinate"
              value={Math.round((totalUploaded / totalToUpload) * 100)}
              size={60}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                color="text.secondary"
              >{`${Math.round(
                (totalUploaded / totalToUpload) * 100
              )}%`}</Typography>
            </Box>
          </Box>
        ) : isDragActive ? (
          "Solte os arquivos aqui"
        ) : (
          "Arraste os boletos aqui, ou clique para selecionar"
        )}
      </Typography>
    </Grid>
  );

  function uploadProgress(progressEvent: any) {
    const { loaded, total } = progressEvent;
    if (loaded === total) setTotalUploaded(++prevTotalUploaded.current);
  }
}
