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

@Service
@Slf4j
public class PdfThumbnailService {

    /**
     * Renders page 1 of the PDF document into a lightweight, crisp JPEG thumbnail.
     * Returns null if rendering fails so upload never gets blocked.
     */
    public byte[] generateThumbnail(InputStream pdfInputStream) {
        try {
            byte[] bytes = pdfInputStream.readAllBytes();
            try (PDDocument document = Loader.loadPDF(bytes)) {
                if (document.getNumberOfPages() > 0) {
                    PDFRenderer pdfRenderer = new PDFRenderer(document);
                    // Render page 0 at 100 DPI for fast loading & sharp preview
                    BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 100, ImageType.RGB);
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    ImageIO.write(bim, "jpeg", out);
                    return out.toByteArray();
                }
            }
        } catch (Exception ex) {
            log.warn("Could not generate thumbnail from PDF: {}", ex.getMessage());
        }
        return null;
    }
}
