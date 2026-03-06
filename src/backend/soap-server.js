const soap = require('soap');
const express = require('express');
const app = express();

const service = {
    EstudianteService: {
        EstudiantePort: {
            ValidarProyecto: function (args) {
                const nombreEstudiante = args.nombre || "Estudiante Genérico";

                const n1 = parseFloat(args.n1) || 0;
                const n2 = parseFloat(args.n2) || 0;
                const notaFinal = (n1 + n2) / 2;

                const estado = notaFinal >= 7 ? "APROBADO" : "REPROBADO";

                return {
                    resultado: `El estudiante ${nombreEstudiante} tiene un promedio de ${notaFinal.toFixed(2)} y su proyecto está ${estado}.`
                };
            }
        }
    }
};

const xml = `
  <definitions name="Estudiantes" targetNamespace="http://tempuri.org/" 
    xmlns:tns="http://tempuri.org/" 
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
    xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
    xmlns="http://schemas.xmlsoap.org/wsdl/">
    
    <message name="ValidarRequest">
        <part name="nombre" type="xsd:string"/>
        <part name="n1" type="xsd:float"/>
        <part name="n2" type="xsd:float"/>
    </message>
    
    <message name="ValidarResponse">
        <part name="resultado" type="xsd:string"/>
    </message>
    
    <portType name="EstudiantePort">
        <operation name="ValidarProyecto">
            <input message="tns:ValidarRequest"/>
            <output message="tns:ValidarResponse"/>
        </operation>
    </portType>
    
    <binding name="EstudianteBinding" type="tns:EstudiantePort">
        <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="ValidarProyecto">
            <soap:operation soapAction="ValidarProyecto"/>
            <input><soap:body use="literal"/></input>
            <output><soap:body use="literal"/></output>
        </operation>
    </binding>
    
    <service name="EstudianteService">
        <port name="EstudiantePort" binding="tns:EstudianteBinding">
            <soap:address location="http://localhost:8000/soap"/>
        </port>
    </service>
  </definitions>`;

app.listen(8000, function () {
    soap.listen(app, '/soap', service, xml);
    console.log("-----------------------------------------");
    console.log("📡 Servidor SOAP corriendo en: http://localhost:8000/soap?wsdl");
    console.log("📝 Servicio: Validación Académica Activo");
    console.log("-----------------------------------------");
});