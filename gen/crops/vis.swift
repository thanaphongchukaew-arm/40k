// ขั้น 2: หาใบหน้าและจุดเด่นของภาพด้วย macOS Vision → out/vis.json  (รัน: swift gen/crops/vis.swift gen/crops/out)
import Vision; import Foundation; import ImageIO
let paths=try! String(contentsOfFile:CommandLine.arguments[1]+"/paths.txt").split(separator:"\n").map(String.init)
var res:[String:Any]=[:]
for p in paths{
 guard let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:p) as CFURL,nil), let img=CGImageSourceCreateImageAtIndex(src,0,nil) else {continue}
 let h=VNImageRequestHandler(cgImage:img)
 let f=VNDetectFaceRectanglesRequest(); let s=VNGenerateAttentionBasedSaliencyImageRequest(); let o=VNGenerateObjectnessBasedSaliencyImageRequest()
 try? h.perform([f,s,o])
 func box(_ r:CGRect)->[Double]{[Double(r.minX),Double(1-r.maxY),Double(r.width),Double(r.height)]}
 let faces=(f.results ?? []).filter{$0.confidence>0.6}.map{box($0.boundingBox)+[Double($0.confidence)]}
 let att=(s.results?.first?.salientObjects ?? []).map{box($0.boundingBox)+[Double($0.confidence)]}
 let obj=(o.results?.first?.salientObjects ?? []).map{box($0.boundingBox)+[Double($0.confidence)]}
 res[p]=["w":img.width,"h":img.height,"faces":faces,"att":att,"obj":obj]
}
let data=try! JSONSerialization.data(withJSONObject:res); try! data.write(to:URL(fileURLWithPath:CommandLine.arguments[1]+"/vis.json")); print(res.count)
