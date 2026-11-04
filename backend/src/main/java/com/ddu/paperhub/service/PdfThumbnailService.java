package com.ddu.paperhub.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
public class PdfThumbnailService {

    /**
     * Renders page 1 of the PDF document into a lightweight, crisp JPEG thumbnail.
     * Returns null if rendering fails so upload never gets blocked.
     */
    public byte[] generateThumbnail(InputStream pdfInputStream) {
        Path tempFile = null;
        try {
            // Write the PDF to a temp file on disk instead of buffering it in heap.
            // PDFBox's Loader only accepts byte[], File, or RandomAccessRead —
            // none of which stream directly from an InputStream without memory pressure.
            tempFile = Files.createTempFile("pdf-thumb-", ".pdf");
            Files.copy(pdfInputStream, tempFile, StandardCopyOption.REPLACE_EXISTING);

            try (PDDocument document = Loader.loadPDF(tempFile.toFile())) {
                if (document.getNumberOfPages() > 0) {
                    PDFRenderer pdfRenderer = new PDFRenderer(document);
                    // Render page 0 at 72 DPI for fast loading & low memory usage
                    BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 72, ImageType.RGB);
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    ImageIO.write(bim, "jpeg", out);
                    return out.toByteArray();
                }
            }
        } catch (Exception ex) {
            log.warn("Could not generate thumbnail from PDF: {}", ex.getMessage());
        } finally {
            if (tempFile != null) {
                try { Files.deleteIfExists(tempFile); } catch (Exception e) { /* ignore */ }
            }
        }
        return null;
    }
}
